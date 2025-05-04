const changeEmail = document.getElementById('btnEmailchange');
const newEmailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

changeEmail.addEventListener('click', async (event) => {
    event.preventDefault();
    await updateEmail(newEmailInput.value, passwordInput.value);
});

const updateEmail = async (newEmail, password) => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!newEmail || !password) {
        alert("Töltsd ki az összes mezőt!");
        return;
    }

    const response = await fetch("http://127.0.0.1:3000/api/editProfileEmail", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ newEmail, password, id: user?.id }),
        credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
        alert("E-mail sikeresen módosítva!");
    } else {
        alert(`Hiba: ${data.error}`);
    }
};
