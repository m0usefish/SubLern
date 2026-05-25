import type { FC } from "react";
import img from "../assets/pageNotFound.png";
import { Link } from "react-router-dom";

const ErrorPage: FC = () => {
  return (
    <div className="font-roboto flex min-h-screen flex-col items-center justify-center gap-10">
      <img src={img} alt="img" className="w-150" />
      <Link
        to={"/"}
        className="hover:pg-sky-600 rounded-md bg-pink-700 text-white px-6 py-2 text-xl"
      >
        Назад
      </Link>
    </div>
  );
};

export default ErrorPage;
