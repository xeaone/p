import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Note } from './types';

const Root = () => {
    const [ notes, setNotes ] = useState<Note[]>([]);
    const [ note, setNote ] = useState<Note>();
    const [ open, setOpen ] = useState(false);

    const openModal =  () => setOpen(true);
    const closeModal = () => {
        setOpen(false);
        setNote(undefined);
    };

    const loadNotes = async () => {
        const r = await fetch('./api/note', { method: 'GET' });
        if (r.status === 200) {
            setNotes(await r.json());
        } else {
            console.error(r);
            console.error(await r.text());
        }
    };

    const deleteNote = async (note:Note) => {
        await fetch('./api/note', { method: 'DELETE', body: JSON.stringify(note) });
        await loadNotes();
    };

    const editNote = async (note: Note) => {
        setNote(note);
        openModal();
    };

    const submitModal = async (e, note?:Note) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = Object.fromEntries(new FormData(form));
        await fetch('./api/note', {
            method: note ? 'PUT' : 'POST',
            body: JSON.stringify(note ? { ...data, note: note.note } : data)
        });
        form.reset();
        closeModal();
        loadNotes();
    };

    useEffect(() => {
        loadNotes();
    }, []);

    return (<>

        <dialog open={open}>
            <article>
                <header>
                    <button aria-label="Close" rel="prev" onClick={closeModal}></button>
                    <h3>{note ? 'Update' : 'Create'} Note</h3>
                </header>
                <form onSubmit={(e) => submitModal(e, note)}>
                    <label>
                        <span>Title</span>
                        <input type="text" name="title" placeholder="Title" aria-label="Title" defaultValue={note?.title??''} required/>
                    </label>
                    <label>
                        <span>Content</span>
                        <textarea name="content" placeholder="Content" aria-label="Content" defaultValue={note?.content??''} required></textarea>
                    </label>
                    <button type="submit" className="outline">{note ? 'Update' : 'Create'}</button>
                </form>
                <footer></footer>
            </article>
        </dialog>

        <nav>
            <ul>
                <li>
                    <h1>Notes</h1>
                </li>
            </ul>
            <ul>
                <li>
                    <button onClick={openModal}>Create Note</button>
                </li>
            </ul>
        </nav>

        {notes.map(note =>
        <details key={note.note}>
            <summary>
                <strong>{note.title}</strong>
                <small>
                    <i>{new Date(note.updated).toLocaleString()}</i>
                </small>
            </summary>
            <article>
                <p>{note.content}</p>
                <button className="outline delete" onClick={()=>deleteNote(note)}>Delete Note</button>
                <button className="outline edit" onClick={()=>editNote(note)}>Edit Note</button>
            </article>
        </details>
        )}

    </>);
};

createRoot(document.querySelector('main') as HTMLElement).render(<Root/>);
