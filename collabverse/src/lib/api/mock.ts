"use server";

import { prisma } from "../db/prisma";

export default async function mock() {
  try {
    await prisma.user.create({
      data: {
        name: "priyanshu",
        email: "priyanshu@gmail.com",
        username: "@priyanshu",
      },
    });
  } catch (e) {
    console.log(e instanceof Error ? e.message : e);
  }
}
