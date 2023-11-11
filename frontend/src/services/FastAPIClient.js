const BACKEND_URL = process.env.REACT_APP_API_URL;

export default class FastApiClient {
    async register(user, firstName, lastName) {
        const request = {
            email: user,
            firstName: firstName,
            lastName: lastName
        };

        const response = await fetch(`${BACKEND_URL}/passwordless/register`, {
            method: 'post',
            body: JSON.stringify(request),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
          const problemDetails = await response.json();

            if (problemDetails && problemDetails.detail) {
                throw new Error(`${problemDetails.detail}`);
            } else {
                throw new Error(`An unknown error prevented us from obtaining a registration token.`);
            }
        }

        return await response.json();
    }

    async signIn(token) {
        return await fetch(`${BACKEND_URL}/passwordless/login?token=${token}`, {
            method: 'post'
        }).then(r => r.json());
    }
}