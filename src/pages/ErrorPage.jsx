import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-5 py-20">
      <h1 className="font-polysans text-display tracking-[-1.32px]">Not found</h1>
      <Link to="/runs" className="text-graphite underline decoration-ember-orange underline-offset-[3px]">
        Kembali ke runs
      </Link>
    </div>
  );
}
