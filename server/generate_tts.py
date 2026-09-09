import sys
import asyncio
import edge_tts

async def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_tts.py <voice> <text> [output_path|-]", file=sys.stderr)
        sys.exit(1)

    voice = sys.argv[1]
    text = sys.argv[2]
    output_path = sys.argv[3] if len(sys.argv) > 3 else '-'

    communicate = edge_tts.Communicate(text, voice)

    if output_path in ('-', 'stdout'):
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                sys.stdout.buffer.write(chunk["data"])
                sys.stdout.buffer.flush()
    else:
        await communicate.save(output_path)

if __name__ == "__main__":
    asyncio.run(main())

