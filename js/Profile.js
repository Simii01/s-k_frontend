
document.addEventListener("DOMContentLoaded", () => {
    loadProfileData()
});

async function loadProfileData(){
    const res = await fetch('/api/Profile', {
        method: 'GET',
        credentials: 'include'
    })

    const data = await res.json();
    console.log(data);
    if(res.ok){
        document.getElementById("username").value = data[0].username || "";
        document.getElementById("email").value = data[0].email || "";
        document.getElementById("profile-picture").style.background = `url(/uploads/${data[0].profile_picture}) no-repeat center/cover`;
    }
    else {
        alert(data.error)
        location.replace("../index.html")
    }
}

// Logout Functionality
document.getElementById("btnLogout").addEventListener("click", async () => {
    await fetch("api/Logout", { method: "POST", credentials: "include" });
    window.location.href = "../index.html"; // Redirect to login
});

