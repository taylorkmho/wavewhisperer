import { useNoaaSurfReport } from "@/hooks/useNoaaSurfReport";
import { AnimatePresence, motion } from "framer-motion";
import { decode } from "html-entities";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { BottomNav } from "./BottomNav";
import { CrystalBall } from "./CrystalBall";

export default function SurfReport() {
  const { data, isLoading, error } = useNoaaSurfReport();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        Telling future...
      </div>
    );
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <section className="relative h-screen w-screen overflow-hidden">
      <CrystalBall poem={data.poem} />
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className="absolute inset-x-0 bottom-4 flex flex-col items-center space-y-2 px-4"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            key="dropdown"
          >
            <div className="relative mx-auto max-w-lg overflow-hidden rounded-xl bg-black/70 font-mono text-sm font-normal text-muted-foreground backdrop-blur-lg">
              <div className="max-h-48 space-y-2 overflow-y-auto p-4">
                {data.discussion.map((paragraph, index) => (
                  <p key={index}>{decode(paragraph)}</p>
                ))}
              </div>
            </div>
            <div className="inline-flex items-center gap-2 overflow-hidden rounded-full bg-secondary text-xs">
              <div className="flex grow items-center gap-2 py-1 pl-1">
                <Image
                  src="/noaa_digital_logo.svg"
                  alt="NOAA"
                  width={30}
                  height={30}
                />
                <h6 className="flex min-w-0 flex-col gap-0.5 leading-none">
                  <span className="text-muted-foreground">
                    Report data pulled from
                  </span>{" "}
                  <Link
                    href="https://www.weather.gov/hfo/SRF"
                    className="truncate font-bold decoration-foreground/50 underline-offset-2 hover:underline"
                    target="_blank"
                  >
                    National Oceanic and Atmospheric Administration
                  </Link>
                </h6>
              </div>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="inline-flex h-full shrink-0 items-center py-2 pl-1.5 pr-2.5 text-xs hover:bg-white/5"
              >
                <IoClose className="size-5" />
              </button>
            </div>
          </motion.div>
        )}
        {!isDropdownOpen && (
          <motion.div
            className="absolute inset-x-0 bottom-4 flex justify-center px-4"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            key="bottom-nav"
          >
            <BottomNav
              date={data.lastBuildDate}
              waveHeights={data.waveHeights}
              onClickDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
              audioFile={data.audioPath}
              surfReportId={data.id}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
