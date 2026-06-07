import {useState, useEffect} from "react"
import api from "../api"
import Note from "../components/Note"
import { Link } from "react-router-dom"

function Home () {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);

    useEffect(() => {
        getNote()
    }, [])

    const getNote = () => {
        api.get("api/notes/")
        .then((res) => res.data)
        .then((data) => { setNotes(data); console.log(data); })
        .catch((error) => console.error("Error fetching notes:", error));
    };

    const deleteNote = (id) => {
        api.delete(`/api/notes/delete/${id}/`).then((res) => {
            if (res.status === 204) alert("note deleted")
            else alert("failed to delete note");
            getNote();
        }).catch((error) => alert(error));
    }

    const createNote = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (image) formData.append("images", image);
        await api.post("/api/notes/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        getNote();
    }

    return (
        <div>
            <div>
                <h2>Notes</h2>
                {notes.map((note) => (
                    <Note note={note} onDelete={deleteNote} key={note.id} />
                ))}
            </div>
            <h2>Create a Note</h2>
            <form onSubmit={createNote}>
                <label htmlFor="title">Title:</label>
                <br />
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                />
                <label htmlFor="content">Content:</label>
                <br />
                <textarea
                    id="content"
                    name="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <br />
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                <input type="submit" value="Submit"></input>
            </form>
            <p>Don't have an account? <Link to="/logout">Logout</Link></p>
        </div>
    );
}

export default Home