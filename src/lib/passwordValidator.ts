export async function isPasswordValid(password: string) {
  return (await hashPassword(password)) === process.env.ADMIN_PASSWORD_HASH;
}

async function hashPassword(password: string) {
  const arrayBuffer = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(password)
  );
  return Buffer.from(arrayBuffer).toString("base64");
}
