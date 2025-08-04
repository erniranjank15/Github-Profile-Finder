const usernameInput = document.getElementById('userinput');
const searchBtn = document.getElementById('searchBtn');
const languageFilter = document.getElementById('languageFilter');
const spinner = document.getElementById('spinner');
const profile = document.getElementById('profile');
const repos = document.getElementById('repos');
const errorMsg = document.getElementById('errorMsg');
const activity = document.getElementById('activity');

/*
usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchBtn.click();
});
*/


languageFilter.addEventListener('change', () => {
    const username = usernameInput.value.trim();
    if (username) searchRepos(username);
});

searchBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();

    if (!username){
        alert("Please Enter valid Github Username");
        return
    }
        

    searchUser(username);
    searchRepos(username);
    searchActivity(username);
});

async function searchUser(username) {
    errorMsg.textContent = "";
    profile.innerHTML = "";
    spinner.style.display = "block";

    try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (!res.ok) throw new Error(`User not found (${res.status})`);

        const data = await res.json();

        profile.innerHTML = `
            <img src="${data.avatar_url}" alt="Avatar">
            <h1>${data.name || "No Name Available"}</h1>
            <p>${data.bio || "No Bio Provided"}</p>
            <p>Public Repos: ${data.public_repos}</p>
            <p>Followers: ${data.followers}</p>
            <p>Following: ${data.following}</p>
            <a href="${data.html_url}" target="_blank">View Profile</a>
        `;
        profile.classList.remove('hidden');
    } catch (error) {
        console.error(error.message);
        errorMsg.textContent = error.message;
        profile.classList.add('hidden');
    } finally {
        spinner.style.display = "none";
    }
}

async function searchRepos(username) {
    repos.innerHTML = "";
    spinner.style.display = "block";

    try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=created&per_page=50`);
        if (!res.ok) throw new Error(`Repo fetch failed (${res.status})`);

        const reposData = await res.json();
        const selectedLang = languageFilter.value;

        const filtered = selectedLang === "all"
            ? reposData
            : reposData.filter(repo => repo.language === selectedLang);

       // console.log(selectedLang);
       // console.log(filtered)

        if (filtered.length === 0) {
            repos.innerHTML = "<p>No repositories found for selected language.</p>";
        } else {
            let repoHTML = `<h3>Top Repositories:</h3>`;
            filtered.slice(0, 5).forEach(repo => {
                repoHTML += `
                    <div class="repo fade-in">
                        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                        <p>${repo.description || "No description"}</p>
                        <span>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | ${repo.language || ""}</span>
                    </div>
                `;
            });
            repos.innerHTML = repoHTML;
        }

        repos.classList.remove('hidden');
    } catch (error) {
        console.error(error.message);
        errorMsg.textContent = error.message;
        repos.classList.add('hidden');
    } finally {
        spinner.style.display = "none";
    }
}






 async function searchActivity(username) {
    activity.innerHTML = "";
    spinner.style.display = "block";

    try {
        const res = await fetch(`https://api.github.com/users/${username}/events/public`);
        if (!res.ok) throw new Error(`Activity fetch failed (${res.status})`);

        const events = await res.json();

        if (events.length === 0) {
            activity.innerHTML = "<p>No Recent Activities found.</p>";
        } else {
            let activityHTML = `<h3>Recent Activities:</h3>`;
            events.slice(0, 5).forEach(event => {
                activityHTML += `<p>${event.type} in ${event.repo.name} - ${new Date(event.created_at).toLocaleString()}</p>`;
            });
            activity.innerHTML = activityHTML;
            activity.classList.remove('hidden');
        }

    } catch (error) {
        console.error(error.message);
        errorMsg.textContent = error.message;
        activity.classList.add('hidden');
    } finally {
        spinner.style.display = "none";
    }

}
