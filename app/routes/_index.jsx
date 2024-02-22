import { useEffect, useRef } from "react";
import { useFetcher } from "@remix-run/react";
import { format } from "date-fns";
import mongoose from "mongoose";

export async function action({ request }) {
  let formData = await request.formData();

  // Artificially slow down the form submission to show pending UI
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mongoose will throw an error if the entry data is invalid (and we don't
  // catch it here, so it will be caught by Remix's error boundary and displayed
  // to the user — we can improve on that later)
  return mongoose.models.Entry.create({
    date: new Date(formData.get("date")),
    type: formData.get("type"),
    text: formData.get("text"),
  });
}

export default function Index() {
  const fetcher = useFetcher();
  const textareaRef = useRef(null);

  const isIdle = fetcher.state === "idle";
  const isInit = isIdle && fetcher.data == null;

  // Clear the form and focus the textarea after a submission
  useEffect(() => {
    if (!isInit && isIdle && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [isInit, isIdle]);

  return (
    <div className="p-10">
      <h1 className="text-5xl">Work Journal</h1>
      <p className="mt-2 text-lg text-gray-400">
        Learnings and doings. Updated weekly.
      </p>

      <div className="my-8 border p-3">
        <p className="italic">Create a new entry</p>

        <fetcher.Form method="post" className="mt-2">
          <fieldset
            className="disabled:opacity-70"
            disabled={fetcher.state === "submitting"}
          >
            <div>
              <div>
                <input
                  type="date"
                  name="date"
                  required
                  className="text-gray-900"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="mt-4 space-x-4">
                <label className="inline-block">
                  <input
                    required
                    type="radio"
                    defaultChecked
                    className="mr-1"
                    name="type"
                    value="work"
                  />
                  Work
                </label>
                <label className="inline-block">
                  <input
                    type="radio"
                    className="mr-1"
                    name="type"
                    value="learning"
                  />
                  Learning
                </label>
                <label className="inline-block">
                  <input
                    type="radio"
                    className="mr-1"
                    name="type"
                    value="interesting-thing"
                  />
                  Interesting thing
                </label>
              </div>
            </div>
            <div className="mt-4">
              <textarea
                ref={textareaRef}
                placeholder="Type your entry..."
                name="text"
                className="w-full text-gray-700"
                required
              />
            </div>
            <div className="mt-2 text-right">
              <button
                type="submit"
                className="bg-blue-500 px-4 py-1 font-semibold text-white"
              >
                {fetcher.state === "submitting" ? "Saving..." : "Save"}
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>

      <div className="mt-6">
        <p className="font-bold">
          Week of February 27<sup>th</sup>
        </p>

        <div className="mt-3 space-y-4">
          <div>
            <p>Work</p>
            <ul className="ml-8 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </div>
          <div>
            <p>Learnings</p>
            <ul className="ml-8 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </div>
          <div>
            <p>Interesting things</p>
            <ul className="ml-8 list-disc">
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
