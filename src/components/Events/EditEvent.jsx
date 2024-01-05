import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation()
  const submit = useSubmit()
  const { id } = useParams()

  const { data, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 10000
  })

  /*
  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["events", id] })
      const prevEvent = queryClient.getQueryData(["events", id])

      queryClient.setQueriesData(["events", id], data.event)

      return { prevEvent }
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", id], context.prevEvent)
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", id])
    }
  })
  */

  function handleSubmit(formData) {
   submit(formData, { method: "PUT" }) // No http request is sent. submit method is used to trigger the client side action function
  }

  function handleClose() {
    navigate('../');
  }

  let content

  if (isError) content = <>
    <ErrorBlock title="Failed to load event." message={error.info?.message || "Failed to load event. Please check your inputs and try again later."} />
    <div className="form-actions">
      <Link to="../" className="button">Okay</Link>
    </div>
  </>

  if (data) content = (
    <EventForm inputData={data} onSubmit={handleSubmit}>
      {state === "submitting" ? <p>Sending data...</p> : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )
      }
    </EventForm>
  )

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}

export const loader = ({ params: { id }}) => {
  return queryClient.fetchQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id })
  })
}

export const action = async ({ request, params: { id } }) => {
  const formData = await request.formData()
  const updatedEventData = Object.fromEntries(formData)
  await updateEvent({ id, event: updatedEventData })
  await queryClient.invalidateQueries(["events"])
  return redirect("../")
}