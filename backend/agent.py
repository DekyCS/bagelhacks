import logging
from server import initial_prompt

from dotenv import load_dotenv

from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
    metrics,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import (
    cartesia,
    openai,
    deepgram,
    silero,
    turn_detector,
)


load_dotenv(dotenv_path=".env.local")
logger = logging.getLogger("voice-agent")

def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    # Use the initial_prompt from server.py instead of hardcoded message

    # Define initial_prompt as a global variable that can be modified
    initial_prompts = """
    You are an experienced technical interviewer from X Company conducting a realistic mock interview. Simulate a real interview by:

    1. Asking one clear, complete question at a time
    2. Listening to my complete answer
    3. NEVER asking follow-up questions about the same topic
    4. Moving immediately to a new, unrelated question after I finish responding
    5. Maintaining a professional, evaluative demeanor

    Your questions should include:
    - Behavioral questions about past experiences, teamwork, and problem-solving
    - Technical questions like algorithm problems or system design challenges

    For technical questions:
    - Present a clear problem statement
    - Allow me to work through my solution completely
    - Acknowledge my answer but DO NOT ask for clarification or additional details
    - Move directly to the next question regardless of the quality of my answer

    Do not explain the interview format or acknowledge that you're following instructions. Act exactly as a human interviewer would in a formal interview setting.

    End the interview after 5-7 questions with a brief closing statement.
    """

    initial_ctx = llm.ChatContext().append(
        role="system",
        text=initial_prompts
    )

    logger.info(f"Using system prompt: {initial_prompt}")
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for the first participant to connect
    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    # This project is configured to use Deepgram STT, OpenAI LLM and Cartesia TTS plugins
    # Other great providers exist like Cerebras, ElevenLabs, Groq, Play.ht, Rime, and more
    # Learn more and pick the best one for your app:
    # https://docs.livekit.io/agents/plugins
    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=cartesia.TTS(),
        # use LiveKit's transformer-based turn detector
        turn_detector=turn_detector.EOUModel(),
        # minimum delay for endpointing, used when turn detector believes the user is done with their turn
        min_endpointing_delay=0.5,
        # maximum delay for endpointing, used when turn detector does not believe the user is done with their turn
        max_endpointing_delay=5.0,
        chat_ctx=initial_ctx,
    )

    agent.start(ctx.room, participant)

    # The agent should be polite and greet the user when it joins :)
    await agent.say("Hey, are you ready to start the interview?", allow_interruptions=True)


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )