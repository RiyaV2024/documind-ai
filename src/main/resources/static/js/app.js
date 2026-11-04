function setStatus(el, text, type) {
    el.className = "status" + (type ? " " + type : "");
    el.textContent = "";
    if (type === "loading") {
        const sp = document.createElement("span");
        sp.className = "spinner";
        el.appendChild(sp);
    }
    el.appendChild(document.createTextNode(text));
}

async function uploadPdf() {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const status = document.getElementById("uploadStatus");
    if (fileInput.files.length === 0) {
        setStatus(status, "Choose one PDF first.", "error");
        return;
    }
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    uploadButton.disabled = true;
    setStatus(status, "Uploading... please wait.", "loading");
    try {
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData
        });
    const data = await response.json();
        if (response.ok) {
            setStatus(status, "Done: " + data.fileName + ", " + data.totalPages + " pages", "ok");
            loadDocuments();
        } else {
            setStatus(status, "Error: " + data.message, "error");
        }
    } catch (e) {
        setStatus(status, "No response received from the server.", "error");
    } finally {
        uploadButton.disabled = false;
    }
}
async function loadDocuments() {
    const response = await fetch("/api/documents");
    const docs = await response.json();
    const list = document.getElementById("docList");
    list.innerHTML = "";
    if (docs.length === 0) {
        const li = document.createElement("li");
        li.className = "empty";
        li.textContent = "No PDFs yet. Upload one above.";
        list.appendChild(li);
        return;
    }
    for (const d of docs) {
        const li = document.createElement("li");
        const left = document.createElement("span");
        const name = document.createElement("span");
        name.className = "docname";
        name.textContent = d.fileName;
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = d.chunks + " chunks";
        left.appendChild(name);
        left.appendChild(badge);
        const btn = document.createElement("button");
        btn.className = "danger";
        btn.textContent = "Delete";
        btn.onclick = () => deleteDocument(d.fileName);
        li.appendChild(left);
        li.appendChild(btn);
        list.appendChild(li);
    }
}
async function deleteDocument(fileName) {
    const status = document.getElementById("listStatus");
    if (!confirm("Delete " + fileName + " and all its chunks?")) {
        return;
    }
    try {
        const response = await fetch("/api/documents/" + encodeURIComponent(fileName), {
            method: "DELETE"
        });

        if (response.ok) {
            setStatus(status, "Deleted: " + fileName, "ok");
            loadDocuments();
        } else {
            const data = await response.json();
            setStatus(status, "Error: " + data.message, "error");
        }
    } catch (e) {
        setStatus(status, "No response received from the server.", "error");
    }
}
async function askQuestion() {
    const questionInput = document.getElementById("questionInput");
    const askButton = document.getElementById("askButton");
    const status = document.getElementById("askStatus");
    const answerArea = document.getElementById("answerArea");
    const answerText = document.getElementById("answerText");
    const sourcesList = document.getElementById("sourcesList");

    const question = questionInput.value.trim();
    if (question === "") {
        setStatus(status, "Type a question first.", "error");
        return;
    }

    askButton.disabled = true;
    answerArea.style.display = "none";
    setStatus(status, "Thinking... this can take up to a minute.", "loading");

    try {
        const response = await fetch("/api/documents/ask?question=" + encodeURIComponent(question));
        const data = await response.json();

        if (response.ok) {
            setStatus(status, "", "");
            answerText.textContent = data.answer;
            sourcesList.innerHTML = "";

            if (data.sources.length === 0) {
                const p = document.createElement("p");
                p.className = "empty";
                p.textContent = "No sources.";
                sourcesList.appendChild(p);
            }

            for (const s of data.sources) {
                const det = document.createElement("details");
                const sum = document.createElement("summary");
                sum.textContent = s.fileName + " | page " + s.page;
                const p = document.createElement("p");
                p.textContent = s.text;
                det.appendChild(sum);
                det.appendChild(p);
                sourcesList.appendChild(det);
            }

            answerArea.style.display = "block";
        } else {
            setStatus(status, "Error: " + data.message, "error");
        }
    } catch (e) {
        setStatus(status, "No response received from the server.", "error");
    } finally {
        askButton.disabled = false;
    }
}

document.getElementById("questionInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        askQuestion();
    }
});
loadDocuments();