const editPassword = document.getElementsByClassName('btnpswchange')[0];

editPassword.addEventListener('click', function(event) {
    event.preventDefault();
    editProfilePassword();
});


async function editProfilePassword() {
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

   
    if (password !== password2) {
        return alert('A két jelszó nem egyezik!');
    }

    const res = await fetch('/api/editProfilePassword', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'content-type': 'application/json'
        }, 
        body: JSON.stringify({ password })
    });

    const data = await res.json();
    console.log(data);
    
    if (res.ok) {
        alert(data.message || 'Sikeres jelszo valtoztatas');
        logout();
    } else {
        alert(data.error);
    }
}

async function logout() {
    const res = await fetch('/api/Logout', {
        method: 'POST',
        credentials: 'include'
    });

    const data = await res.json();

    if (res.ok) {
        alert(data.message);
        window.location.href = '../index.html';
    } else {
        alert('Hiba a kijelentkezéskor');
    }
}

