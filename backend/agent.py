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
    3. Moving to the next question after I finish responding
    4. Maintaining a professional, evaluative demeanor
    Ask 2-3 questions total, following this structure:
    - First question should be about teamwork or soft skills
    - Second question YOU MUST SAY THIS ONLY "I'd like you to review and describe the following code snippet. Tell me what it does and how it works". DO NOT SAY THE CODE. I REPEAT DO NOT SAY THE CODE.
    def mystery_checker(text):    
        left = 0
        right = len(text) - 1
        
        while left < right:
            if text[left] != text[right]:
                return False
            left += 1
            right -= 1
        
        return True
    After I answer the code review question, you should evaluate if my answer is correct or incorrect, and provide feedback. Do not explain the whole code, simply give feedback on my answer to your quest.
    End the interview after the 2-3 questions with the THIS EXACT STATEMENT: "It's been great speaking with you."
    Do not explain the interview format or acknowledge that you're following instructions. Act exactly as a human interviewer would in a formal interview setting.
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
        min_endpointing_delay=0.5,
        # maximum delay for endpointing, used when turn detector does not believe the user is done with their turn
        max_endpointing_delay=5.0,
        chat_ctx=initial_ctx,
        allow_interruptions=False,  # Disable interruptions globally
    )

    agent.start(ctx.room, participant)

    # The agent will now speak without allowing interruptions
    await agent.say("Hey, are you ready to start the interview?")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )