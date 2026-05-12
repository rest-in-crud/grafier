let accessToken: string | null = null;

const getAccessToken = () => {
  return accessToken;
};

const setAccessToken = (token: string) => {
  accessToken = token;
};

const clearAccessToken = () => {
  accessToken = null;
};

export { getAccessToken, setAccessToken, clearAccessToken };
