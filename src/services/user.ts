import axios, { AxiosError, AxiosResponse } from 'axios';
export type GoogleUserInfoType = {
  id: string;
  // email: string;
  // verified_email: boolean;
  // name: string;
  // given_name: string;
  // family_name: string;
  // picture: string;
  // locale: string;
  // hd: string;
};
export async function fetchUserInfo(token: string): Promise<GoogleUserInfoType> {
  try {
    const ret: AxiosResponse<GoogleUserInfoType> = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    if (ret.data) {
      return ret.data;
    }
    throw new Error('No data found');
  } catch (e: any) {
    if (e instanceof AxiosError) {
      if (e.response && e.response.data) {
        throw e.response.data;
      }
    }
    throw e;
  }
}
