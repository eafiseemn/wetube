import express from "express";

/*------------------------------ 서버 & Port App 생성 -----------------------------*/
const PORT = 4000; // PORT 는 localhost:port_number 로 접근할 수 있음
const app = express(); // create Express Application (Server)

/*-------------------- Middleward & app.use(): global middleware --------------------*/
const logger = (req, _res, next) => {
	// route_handler는 express에서 request, response object & next function을 받아옴
	console.log("I'm in the middle!", `Somebody is trying to ${req.method} "${req.url}"`);
	next(); // next function 을 호출하는 건 middleware: get() 다음 함수를 호출
};

const privateMiddleware = (req, res, next) => {
	const url = req.url;
	if (url === "/protected") {
		return res.send("<h1>NOT ALLOWED ⛔️</h1>"); // Middleware로 process를 cutting 시킴
	}
	console.log("☑️ Allowed. You may continue.");
	next();
};
app.use(logger, privateMiddleware);

/*-------------------- Request & Response : Home(/) --------------------*/
const handleHome = (req, res) => {
	// request륿 받으면 반드시 response를 return 해야함 (return이 없으면 무한로딩)
	return res.send("<h1>I still love you.</h1>");
	// return res.status(500).end();    // status code === 500 을 보내고 response를 종료시킴
};

// app.get("/", gossipMiddleware, handleHome); // GET: requested_page, ...route_handlers (next()에 의해 순서대로 실행)
app.get("/", handleHome);

/*-------------------- Request & Response : Login(/login) --------------------*/
const handleLogin = (req, res) => {
	return res.send("Login here.");
};
app.get("/login", handleLogin);

/*------------------------------ 외부 접속 Listening ------------------------------*/
const handleListening = () => console.log(`✅ Server Listening on http://localhost:${PORT} 🚀`);
app.listen(PORT, handleListening); // port_number, handler_callback
