import axiosClient from "./axiosClient";

/**
 * The FastAPI /auth/login endpoint expects OAuth2PasswordRequestForm,
 * i.e. application/x-www-form-urlencoded with `email` + `password`.
 */
export function login({ email, password }) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  return axiosClient
    .post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((res) => res.data); // { access_token, token_type }
}

export function register({ email, password, username }) {
  return axiosClient
    .post("/auth/register", {
      email,
      password,
      username: username || null,
    })
    .then((res) => res.data);
}

export function fetchCurrentUser() {
  return axiosClient.get("/users/me").then((res) => res.data);
}
