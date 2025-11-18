const autoBind = require('auto-bind');
const { validateUserPayload } = require('../validators/users');

class UsersHandler {
  constructor(usersService) {
    this._usersService = usersService;
    autoBind(this);
  }

  async postUserHandler(request, h) {
    validateUserPayload(request.payload);
    const userId = await this._usersService.addUser(request.payload);
    const res = h.response({ status: 'success', data: { userId } });
    res.code(201);
    return res;
  }

  async getUserByIdHandler(request) {
    const { id } = request.params;
    const user = await this._usersService.getUserById(id);
    return { status: 'success', data: { user } };
  }
}

module.exports = UsersHandler;