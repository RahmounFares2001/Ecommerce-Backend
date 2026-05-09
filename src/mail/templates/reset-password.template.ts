export function resetPasswordTemplate(token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    return `
      <h2>Welcome</h2>
      <p>Click below to reset your password:</p>
      <a href="....url${token}">Reset Password</a>
    `;
}