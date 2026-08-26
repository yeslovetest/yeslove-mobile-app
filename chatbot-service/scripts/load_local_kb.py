import os
import glob

from app.core.database import SessionLocal
from app.models.document import Document
from app.utils.text_processing import chunk_text


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

KB_DIR = os.path.join(
    BASE_DIR,
    "knowledge_base"
)


def load_local_kb():
    patterns = [
        os.path.join(KB_DIR, "*.txt"),
        os.path.join(KB_DIR, "*.md"),
        os.path.join(KB_DIR, "blogs", "*.txt"),
        os.path.join(KB_DIR, "company", "*.txt"),
    ]

    files = []

    for pattern in patterns:
        files.extend(glob.glob(pattern))

    print(f"Found {len(files)} knowledge-base files")

    with SessionLocal() as session:

        # Clear existing LOCAL POC docs
        session.query(Document).delete()
        session.commit()

        total_chunks = 0

        for path in files:
            print(f"Loading: {os.path.basename(path)}")

            with open(
                path,
                "r",
                encoding="utf-8"
            ) as file:
                content = file.read()

            chunks = chunk_text(content)

            for index, chunk in enumerate(chunks):

                doc = Document(
                    source=os.path.basename(path),
                    chunk_index=index,
                    content=chunk,

                    # Required by current model,
                    # but current retrieval does not use it.
                    embedding="[]",

                    category="yeslove.blogs",
                    source_name="YesLove",
                    priority=1
                )

                session.add(doc)
                total_chunks += 1

        session.commit()

    print(f"Loaded {total_chunks} chunks")


if __name__ == "__main__":
    load_local_kb()