from anthropic import AsyncAnthropic

from app.config import get_settings
from app.schemas import GenerateRepliesRequest, ReplySuggestion, ThreadContext

settings = get_settings()
client = AsyncAnthropic(api_key=settings.anthropic_api_key or "dummy-key-for-tests")


async def generate_suggestions(
    thread_context: ThreadContext, request_params: GenerateRepliesRequest
) -> list[ReplySuggestion]:
    prompt = f"Subject: {thread_context.subject}\n"
    for msg in thread_context.messages:
        prompt += f"From: {msg.from_}\n{msg.body}\n"
    prompt += f"Tone: {request_params.tone.value}\nLength: {request_params.length.value}\n"
    if request_params.instruction:
        prompt += f"Instruction: {request_params.instruction}\n"

    response = await client.messages.create(
        model=settings.ai_model,
        max_tokens=1024,
        system="Generate 3 distinct email reply suggestions.",
        messages=[{"role": "user", "content": prompt}],
        tools=[
            {
                "name": "generate_replies",
                "description": "Output 3 generated replies",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "suggestions": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "text": {"type": "string"},
                                },
                                "required": ["id", "text"],
                            },
                        }
                    },
                    "required": ["suggestions"],
                },
            }
        ],
        tool_choice={"type": "tool", "name": "generate_replies"},
    )

    for block in response.content:
        if block.type == "tool_use" and block.name == "generate_replies":
            return [ReplySuggestion(**s) for s in block.input["suggestions"]]
    return []
