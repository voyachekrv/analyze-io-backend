export enum UserRoles {
	USER = 'USER',
	ROOT = 'ROOT'
}

export class User {
	constructor(email: string, password: string, role?: UserRoles) {
		this.email = email;
		this.password = password;

		if (role) {
			this.role = role;
		}
	}

	id: number;

	email: string;

	password: string;

	role: UserRoles;
}
