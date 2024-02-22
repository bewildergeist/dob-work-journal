import { useEffect, useRef } from "react";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { format, startOfWeek, parseISO } from "date-fns";
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

export async function loader() {
  const entries = await mongoose.models.Entry.find().lean().exec();

  return entries.map((entry) => ({
    ...entry,
    date: entry.date.toISOString().substring(0, 10),
  }));
}

export default function Index() {
  const entries = useLoaderData();
  const fetcher = useFetcher();
  const textareaRef = useRef(null);

  const isIdle = fetcher.state === "idle";
  const isInit = isIdle && fetcher.data == null;

  const entriesByWeek = entries.reduce((memo, entry) => {
    let sunday = startOfWeek(parseISO(entry.date));
    let sundayString = format(sunday, "yyyy-MM-dd");

    memo[sundayString] ||= [];
    memo[sundayString].push(entry);

    return memo;
  }, {});

  const weeks = Object.keys(entriesByWeek)
    .sort((a, b) => a.localeCompare(b))
    .map((dateString) => ({
      dateString,
      work: entriesByWeek[dateString].filter((entry) => entry.type === "work"),
      learnings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "learning",
      ),
      interestingThings: entriesByWeek[dateString].filter(
        (entry) => entry.type === "interesting-thing",
      ),
    }));

  // Clear the form and focus the textarea after a submission
  useEffect(() => {
    if (!isInit && isIdle && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [isInit, isIdle]);

  return (
    <div>
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

      <div className="mt-12 space-y-12">
        {weeks.map((week) => (
          <div key={week.dateString}>
            <p className="font-bold">
              Week of {format(parseISO(week.dateString), "MMMM do")}
            </p>
            <div className="mt-3 space-y-4">
              {week.work.length > 0 && (
                <div>
                  <p>Work</p>
                  <ul className="ml-8 list-disc">
                    {week.work.map((entry) => (
                      <EntryListItem key={entry._id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.learnings.length > 0 && (
                <div>
                  <p>Learning</p>
                  <ul className="ml-8 list-disc">
                    {week.learnings.map((entry) => (
                      <EntryListItem key={entry._id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
              {week.interestingThings.length > 0 && (
                <div>
                  <p>Interesting things</p>
                  <ul className="ml-8 list-disc">
                    {week.interestingThings.map((entry) => (
                      <EntryListItem key={entry._id} entry={entry} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryListItem({ entry }) {
  return (
    <li className="group">
      {entry.text}

      <Link
        to={`/entries/${entry._id}/edit`}
        className="ml-2 text-blue-500 opacity-0 group-hover:opacity-100"
      >
        Edit
      </Link>
    </li>
  );
}
