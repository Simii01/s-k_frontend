const editUsername = document.getElementsByClassName("btnUsernamechange")[0];

editUsername.addEventListener("click", function (event) {
    event.preventDefault();
    editProfileName();
});

async function editProfileName() {
    const username = document.getElementById("username").value;
    const username2 = document.getElementById("username2").value;

    if (username !== username2) {
        return alert("A két felhasználónév nem egyezik!");
    }

    const res = await fetch("/api/editProfileUsername", {
        method: "PUT",
        credentials: "include",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ username }),
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
        alert(data.message || "Sikeres felhasználónév válzoztatás!");
        window.location.href = "../Profile.html";
    } else {
        alert(data.error);
    }
}
