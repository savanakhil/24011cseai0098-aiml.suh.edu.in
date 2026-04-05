import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";

// ------------------ REPORT FORM ------------------

function ReportForm() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("lost");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = "";

    if (image) {
      const imageRef = ref(storage, "items/" + image.name);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }

    await addDoc(collection(db, "items"), {
      title,
      type,
      imageUrl,
      createdAt: serverTimestamp(),
    });

    alert("Item Added!");
    setTitle("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Report Item</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Item name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />

        <select onChange={(e) => setType(e.target.value)}>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <br /><br />

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <br /><br />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

// ------------------ FEED ------------------

function Feed() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  const filteredItems = items.filter(item => {
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Item Feed</h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTER */}
      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("lost")}>Lost</button>
        <button onClick={() => setFilter("found")}>Found</button>
      </div>

      {/* ITEMS */}
      <div>
        {filteredItems.map(item => (
          <div key={item.id} style={{ border: "1px solid black", margin: 10, padding: 10 }}>
            <h3>{item.title}</h3>
            <p>{item.type}</p>

            {item.imageUrl && (
              <img src={item.imageUrl} alt="item" width="200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------ MAIN APP ------------------

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/report" element={<ReportForm />} />
      </Routes>
    </Router>
  );
}