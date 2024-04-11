import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Note } from './types';

const NotFound = () => <h1>Not Found</h1>;

const SignIn = () => {
    const submit = async (e) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const data = Object.fromEntries(new FormData(form));
        const result = await fetch('./api/sign-in', { method: 'POST', body: JSON.stringify(data) });

        if (result.status === 200) {
            form.reset();
            window.location.assign('./');
        } else {
            alert(`Error: ${result.status} - ${await result.text()}`);
        }
    };

    return <>
         <nav>
            <ul>
                <li>
                    <h1>Sign In</h1>
                </li>
            </ul>
            <ul>
                <li>
                    <a href="./sign-up" role="button">Sign In</a>
                </li>
            </ul>
        </nav>
        <form onSubmit={submit}>
            <label>
                <span>Email</span>
                <input type="email" name="email" placeholder="Email" aria-label="email" required />
            </label>
            <label>
                <span>Password</span>
                <input type="password" name="password" placeholder="Password" aria-label="password" required />
            </label>
            <button type="submit" className="outline">Sign In</button>
        </form>
    </>;
}

const SignUp = () => {

    const submit = async (e) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const data = Object.fromEntries(new FormData(form));
        const result = await fetch('./api/sign-up', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (result.status === 200) {
            form.reset();
            window.location.assign('./sign-in');
        } else {
            alert(`Error: ${result.status} - ${await result.text()}`);
        }
    };

    return <>
         <nav>
            <ul>
                <li>
                    <h1>Sign Up</h1>
                </li>
            </ul>
            <ul>
                <li>
                    <a href="./sign-in" role="button">Sign In</a>
                </li>
            </ul>
        </nav>
        <form onSubmit={submit}>
            <label>
                <span>Email</span>
                <input type="email" name="email" placeholder="Email" aria-label="email" required />
            </label>
            <label>
                <span>Password</span>
                <input type="password" name="password" placeholder="Password" aria-label="password" required />
            </label>
            <button type="submit" className="outline">Sign Up</button>
        </form>
    </>;
}

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
        const result = await fetch('./api/note', { method: 'GET' });
        if (result.status === 200) {
            setNotes(await result.json());
        } else if (result.status === 401) {
            window.location.assign('./sign-up');
        } else {
            console.error(result);
            console.error(await result.text());
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
        const method = note ? 'PUT' : 'POST';
        const body = JSON.stringify(note ? { ...data, note: note.note } : data);

        await fetch('./api/note', { method, body });

        form.reset();
        closeModal();
        loadNotes();
    };

    useEffect(() => {
        loadNotes();
    }, []);

    return <>

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

    </>;
};

const path = window.location.pathname.replace(/\/(Stage|Pro)\/?/, '/');
const root = document.querySelector('main') as HTMLElement;

const page =
    path === '/' ? <Root /> :
        path === '/sign-up' ? < SignUp /> :
            path === '/sign-in' ? <SignIn /> :
                <NotFound />;

createRoot(root).render(page);
