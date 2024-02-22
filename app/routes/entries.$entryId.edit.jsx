import { useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";

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

export default function EditPage() {
  let entry = useLoaderData();

  return (
    <div className="mt-4">
      <p>Editing entry {entry._id}</p>
    </div>
  );
}
