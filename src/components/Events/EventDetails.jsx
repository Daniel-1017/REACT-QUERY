import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()

  const { data: event, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id })
  })

  const handleStartDelete = () => setIsDeleting(true)

  const handleStopDelete = () => setIsDeleting(false)

  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: deleteError } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"], refetchType: "none" })
      navigate("/events")
    }
  })

  const handleDelete = () => mutate({ id })

  let content

  if (isPending) content = <div id="event-details-content" className="center">
    <p>Fetching event data...</p>
  </div>

  if (isError) content = <div id="event-details-content" className="center">
    <ErrorBlock title="Failed to load event" message={error.info?.message || "Failed to fetch event data."} />
  </div>

  if (event) {
    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
    content = (
      <>
        <header>
          <h1>{event?.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${event.image}`} alt={event.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{event.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate} @ {event.time}</time>
            </div>
            <p id="event-details-description">{event.description}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {isDeleting && 
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event? This action cannot be undone.</p>
          {isPendingDeletion && <p>Deleting, please, wait...</p>}
          {!isPendingDeletion &&
            <div className="form-actions">
              <button onClick={handleStopDelete} className="button-text">Cancel</button>
              <button onClick={handleDelete} className="button">Delete</button>
            </div>
          }
          {isErrorDeleting && <ErrorBlock title="Failed to delete event" message={deleteError.info?.message || "Failed to delete event."} />}
        </Modal>
      }
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
