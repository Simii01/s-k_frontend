document.addEventListener("DOMContentLoaded", () => {
    loadProfileData();
});

async function loadProfileData() {
    const res = await fetch("/api/Profile", {
        method: "GET",
        credentials: "include",
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
        document.getElementById("username").value = data[0].username || "";
        document.getElementById("email").value = data[0].email || "";

        const profilePictureDiv = document.getElementById("profile-picture");

        if (data[0].profile_picture) {
            profilePictureDiv.style.backgroundImage = `url(/uploads/${data[0].profile_picture})`;
            profilePictureDiv.style.backgroundPosition = "center";
            profilePictureDiv.style.backgroundSize = "cover";
            profilePictureDiv.style.backgroundRepeat = "no-repeat";
        } else {
            profilePictureDiv.style.backgroundImage = "url('./images/default-profile.png')";
        }
    } else {
        alert(data.error);
        location.replace("../index.html");
    }
}

document.getElementById("btnLogout").addEventListener("click", async () => {
    await fetch("/api/Logout", { method: "POST", credentials: "include" });
    window.location.href = "../index.html";
});

const changeProfilePictureButton = document.getElementById("change-profile-picture");
const fileUploadInput = document.getElementById("file-upload");

changeProfilePictureButton.addEventListener("click", () => {
    fileUploadInput.click();
});

fileUploadInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
        const res = await fetch("/api/editProfilePic", {
            method: "PUT",
            body: formData,
            credentials: "include",
        });

        if (res.ok) {
            alert("Profilkép frissítve! 🎉");
            loadProfileData();
        } else {
            const errorData = await res.json();
            alert(errorData.error || "Nem sikerült a profilkép frissítése.");
        }
    } catch (error) {
        console.error("Hiba a profilkép feltöltésénél:", error);
    }
});
