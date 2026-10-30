import { useEffect } from "react";
import { href } from "../../shared/route";

/** The simulator is the driver view itself in demo mode, with the "next step" button. */
export default function Simulador() {
  useEffect(() => {
    window.location.replace(href("conductor", { demo: "1" }));
  }, []);
  return null;
}
