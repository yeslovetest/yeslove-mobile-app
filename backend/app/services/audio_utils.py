import os
import subprocess
import tempfile


def convert_to_wav(input_path: str):

    fd, output_path = tempfile.mkstemp(
        suffix=".wav"
    )

    os.close(fd)

    command = [
        "ffmpeg",
        "-y",
        "-i",
        input_path,
        "-ac",
        "1",
        "-ar",
        "16000",
        output_path
    ]

    try:
        subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

    except subprocess.CalledProcessError as exc:

        if os.path.exists(output_path):
            os.remove(output_path)

        error = exc.stderr.decode(
            "utf-8",
            errors="ignore"
        )

        raise RuntimeError(
            f"Audio conversion failed: {error}"
        )

    return output_path