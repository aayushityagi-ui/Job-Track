
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [jobs, setJobs] = useState(() => {
    try {
      const savedJobs = localStorage.getItem("jobtrack-jobs");

      if (savedJobs !== null) {
        return JSON.parse(savedJobs);
      }
    } catch (error) {
      console.error("Could not load saved jobs:", error);
    }

    return [
      {
        id: 1,
        company: "Google",
        role: "Frontend Developer",
        status: "Applied",
        date: "2026-10-20",
      },
      {
        id: 2,
        company: "Microsoft",
        role: "React Developer",
        status: "Interview",
        date: "2026-10-22",
      },
    ];
  });

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  // Load jobs from MongoDB
useEffect(() => {
  async function fetchJobs() {
    try {
      const response = await fetch("http://localhost:5000/api/jobs");

      if (!response.ok) {
        throw new Error("Could not fetch jobs");
      }

      const data = await response.json();

      setJobs(data);
    } catch (error) {
      console.error("Error loading jobs from MongoDB:", error);
    }
  }

  fetchJobs();
}, []);
  // Save jobs in browser localStorage
  useEffect(() => {
    try {
      localStorage.setItem("jobtrack-jobs", JSON.stringify(jobs));
    } catch (error) {
      console.error("Could not save jobs:", error);
    }
  }, [jobs]);

  // Add a new job application to MongoDB
  async function addJob(event) {
    event.preventDefault();

    if (!company.trim() || !role.trim()) {
      alert("Please enter both company name and job title.");
      return;
    }

   if (editingId !== null) {
  const updatedJob = {
    company: company.trim(),
    role: role.trim(),
    status: status,
    date: new Date().toISOString().slice(0, 10),
  };
try {
  const response = await fetch(
    `http://localhost:5000/api/jobs/${editingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedJob),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update job in MongoDB");
  }

  setJobs((previousJobs) =>
    previousJobs.map((job) =>
      job.id === editingId
        ? { ...job, ...updatedJob }
        : job
    )
  );

  alert("Job updated successfully!");
} catch (error) {
  console.error("Error updating job:", error);
  alert("Could not update job in MongoDB.");
}

  setEditingId(null);
  setCompany("");
  setRole("");
  setStatus("Applied");

  return;
} const newJob = {
      company: company.trim(),
      role: role.trim(),
      status: status,
      date: new Date().toISOString().slice(0, 10),
    };

    try {
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJob),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save job");
      }

      const savedJob = {
        ...newJob,
        id: data.jobId,
      };

      setJobs((previousJobs) => [savedJob, ...previousJobs]);

      setCompany("");
      setRole("");
      setStatus("Applied");

      alert("Job application saved successfully!");
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Could not save job. Please check that the backend is running.");
    }
  }
// Start editing a job application
function startEdit(job) {
  setEditingId(job.id);
  setCompany(job.company);
  setRole(job.role);
  setStatus(job.status);
}
  // Delete a job application
  async function deleteJob(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this application?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/jobs/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Could not delete application");
      return;
    }

    setJobs((previousJobs) =>
      previousJobs.filter((job) => job.id !== id)
    );

    alert("Application deleted successfully!");
  } catch (error) {
    console.error("Delete error:", error);
    alert("Server connection failed. Please check the backend.");
  }
}

  // Search job applications
  const filteredJobs = jobs.filter((job) =>
    `${job.company} ${job.role} ${job.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          JobTrack<span>.</span>
        </div>

        <div className="tagline">Your career, organized.</div>
      </header>

      <section className="welcome">
        <p className="eyebrow">YOUR CAREER DASHBOARD</p>

        <h1>Keep your job search on track.</h1>

        <p>
          Manage applications, track interviews, and celebrate progress.
        </p>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span>Total Applications</span>
          <strong>{jobs.length}</strong>
        </article>

        <article className="stat-card">
          <span>Interviews</span>
          <strong>
            {jobs.filter((job) => job.status === "Interview").length}
          </strong>
        </article>

        <article className="stat-card">
          <span>Offers</span>
          <strong>
            {jobs.filter((job) => job.status === "Offer").length}
          </strong>
        </article>

        <article className="stat-card">
          <span>Rejected</span>
          <strong>
            {jobs.filter((job) => job.status === "Rejected").length}
          </strong>
        </article>
      </section>

      <section className="content-grid">
        <form className="panel job-form" onSubmit={addJob}>
          <h2>Add an application</h2>

          <p className="muted">Record a new job opportunity.</p>

          <label htmlFor="company">Company name</label>

          <input
            id="company"
            type="text"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="e.g. Amazon"
            required
          />

          <label htmlFor="role">Job title</label>

          <input
            id="role"
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="e.g. Junior Web Developer"
            required
          />

          <label htmlFor="status">Application status</label>

          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button type="submit" className="primary-button">
          {editingId !== null ? "Update application" : "+ Add application"}
</button>
            
          
        </form>

        <section className="panel applications">
          <div className="list-heading">
            <div>
              <h2>Your applications</h2>

              <p className="muted">
                Keep every opportunity in view.
              </p>
            </div>

            <span className="count">{filteredJobs.length} jobs</span>
          </div>

          <input
            className="search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company, role or status..."
            aria-label="Search applications"
          />

          {filteredJobs.length === 0 ? (
            <p className="empty">
              No applications found. Add one to get started.
            </p>
          ) : (
            <div className="job-list">
              {filteredJobs.map((job) => (
                <article className="job-card" key={job.id}>
                  <div className="company-icon">
                    {job.company.charAt(0).toUpperCase()}
                  </div>

                  <div className="job-info">
                    <h3>{job.role}</h3>

                    <p>{job.company}</p>

                    <small>Applied on {job.date}</small>
                  </div>

                  <div className="job-actions">
                    <span className={`status ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>

            <button
  type="button"
  className="delete-button"
  onClick={() => startEdit(job)}
>
  Edit
</button>

<button
  type="button"
  className="delete-button"
  onClick={() => deleteJob(job.id)}
>
  Delete
</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      <footer>Built with React · JobTrack Portfolio Project</footer>
    </main>
  );
}

export default App;
