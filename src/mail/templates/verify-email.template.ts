export function verifyEmailTemplate(token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    return `
      <h2>Welcome</h2>
      <p>Click below to verify your email:</p>
      <a href="${url}">Verify Email</a>
    `;
}