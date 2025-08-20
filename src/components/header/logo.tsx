"use client";

import Image from "next/image";
import Link from "next/link";


export default function Logo() {

  return (
    <Link href="/">
      <div className="text-3xl font-bold">
        {/* <Image src="/Oso-OsomGPT-logo.png" width={240} height={50} alt="Osom logo" /> */}
        <Image src="/Oso-OsomGPT-logo.png" width={240} height={50} alt="Osom logo" />
      </div>
    </Link>

  )
}
