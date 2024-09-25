const {queryFn} = require("../../utils/queryFunction");
const { comparePassword } = require("../../utils/bcryptHashing");
const generateToken = require("../../service/generateToken");
const { customResponse } = require("../../utils/customResponse");
const CustomError = require("../../utils/CustomError");

const _loginUser = `
    SELECT 
        email,
        password,
        userid,
        firstname
    FROM 
        users 
    WHERE 
        email = $1`;

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return customResponse(res, 400, "All fields are required.", null, true);
        }

        const user = await queryFn(_loginUser, [email]);

        if (!user.rows.length) {
            return customResponse(res, 401, "Invalid User ID or Password", null, true);
        }

        const isPasswordValid = await comparePassword(password, user.rows[0].password);

        if (!isPasswordValid) {
            return customResponse(res, 401, "Invalid User ID or password", null, true);
        }

        const token = generateToken(user.rows[0]);
        const payload = { email: user.rows[0].email, userid: user.rows[0].userid };

        return customResponse(res, 200, "Login successful", { user: payload, token });
    } catch (error) {
        console.error("Error during login:", error);
        return customResponse(res, 500, "Internal Server Error", null, true);
    }
};

module.exports = login;