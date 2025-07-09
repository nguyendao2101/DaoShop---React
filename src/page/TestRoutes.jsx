// src/page/TestRoutes.jsx - Tạo tạm để test
function TestRoutes() {
    return (
        <div className="p-8">
            <h1>Test Routes</h1>
            <div className="space-y-2">
                <a href="/" className="block text-blue-500">Home (/)</a>
                <a href="/auth" className="block text-blue-500">Auth (/auth)</a>
                <a href="/auth/success" className="block text-blue-500">Google Success (/auth/success)</a>
                <a href="/auth/success?token=test123" className="block text-blue-500">
                    Google Success with token
                </a>
            </div>
        </div>
    )
}

export default TestRoutes