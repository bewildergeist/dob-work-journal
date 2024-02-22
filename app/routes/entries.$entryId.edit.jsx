import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import EntryForm from "~/components/entry-form";

/* LOADER --------------------------------------------------------- */
export async function loader({ params }) {
  if (typeof params.entryId !== "string") {
    throw new Response("Not found", { status: 404 });
  }

  let entry = await mongoose.models.Entry.findById(params.entryId)
    .lean()
    .exec();

  if (!entry) {
    throw new Response("Not found", { status: 404 });
  }

  return {
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  };
}

/* ACTION --------------------------------------------------------- */
export async function action({ request, params }) {
  if (typeof params.entryId !== "string") {
    throw new Response("Not found", { status: 404 });
  }

  let formData = await request.formData();

  // Artificial delay to simulate slow network
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (formData.get("_action") === "delete") {
    await mongoose.models.Entry.findByIdAndDelete(params.entryId);

    return redirect("/");
  } else {
    const entry = await mongoose.models.Entry.findById(params.entryId);

    entry.date = new Date(formData.get("date"));
    entry.type = formData.get("type");
    entry.text = formData.get("text");

    // Mongoose will automatically validate the entry before saving and if it
    // throws an error, Remix will catch it and display it to the user
    await entry.save();

    return redirect("/");
  }
}

/* UI ------------------------------------------------------------- */
export default function EditPage() {
  let entry = useLoaderData();

  function handleSubmit(event) {
    if (!confirm("Are you sure?")) {
      event.preventDefault();
    }
  }

  return (
    <div className="mt-4">
      <p>Editing entry {entry._id}</p>

      <div className="mt-8">
        <EntryForm entry={entry} />
      </div>
      <div className="mt-8">
        <Form method="post" onSubmit={handleSubmit}>
          <button
            name="_action"
            value="delete"
            className="text-gray-500 underline"
          >
            Delete this entry...
          </button>
        </Form>
      </div>
    </div>
  );
}
