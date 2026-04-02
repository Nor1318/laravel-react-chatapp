export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            <rect x="14" y="14" width="92" height="92" rx="24" fill="currentColor" />
            <path
                d="M35 44c0-5.523 4.477-10 10-10h30c11.046 0 20 8.954 20 20s-8.954 20-20 20H63l-13 12v-12h-5c-5.523 0-10-4.477-10-10V44z"
                fill="white"
            />
            <path
                d="M72.5 48.5h-16a3 3 0 1 0 0 6h16a3 3 0 1 0 0-6zm-3 12h-13a3 3 0 1 0 0 6h13a3 3 0 1 0 0-6z"
                fill="currentColor"
            />
        </svg>
    );
}
