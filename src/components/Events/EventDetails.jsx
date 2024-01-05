import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const { data: event, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id })
  })

  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
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
            <button onClick={handleDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost/3000/${event.image}`} alt={event.title} />
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
