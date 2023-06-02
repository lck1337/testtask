let apps = [];
let editingAppIndex = null;

function getAppDataFromForm() {
    return {
        app_id: $('#appIdInput').val(),
        app_name: $('#nameInput').val(),
        policy_id: parseInt($('#policyIdInput').val()),
        agent_js_config: $('#agentConfigInput').val(),
        correlations_config: $('#correlationsConfigInput').val(),
    };
}

let chart = null;

function updateChart(apps) {
    const ctx = document.getElementById('chart').getContext('2d');
    const labels = apps.map(app => app.app_id);
    const data = apps.map(app => app.policy_id);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Policy ID by App ID',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'App ID'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Policy ID'
                    }
                }
            }
        }
    });
}


function fillAppForm(app) {
    // Здесь мы заполняем форму данными приложения.
    $('#appIdInput').val(app.app_id);
    $('#nameInput').val(app.name);
    $('#descriptionInput').val(app.description);
    $('#dateInput').val(app.date);
}

function clearAppForm() {
    // Здесь мы очищаем форму
    $('#appIdInput').val('');
    $('#nameInput').val('');
    $('#descriptionInput').val('');
    $('#dateInput').val('');
    $('.error-message').text('');
}

async function loadApps() {
    // Здесь мы загружаем список приложений с сервера
    let response = await axios.post('http://localhost:3000/Face/App_List');
    let data = response.data;

    apps = data;
    fillAppTable(apps);
    updateChart(apps);
}

async function saveApp(app, isNewApp) {
    let url = isNewApp ? 'http://localhost:3000/Face/New_app' : 'http://localhost:3000/Face/Update_app';
    let method = 'POST';
    let response = await axios({
        method: method,
        url: url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(app)
    });

    let data = response.data;
    return data.error;
}

function getAppDataFromForm() {
    return {
        app_id: $('#appIdInput').val(),
        app_name: $('#nameInput').val(),
        policy_id: $('#policyIdInput').val(),
        agent_js_config: $('#agentJsConfigInput').val(),
        correlations_config: $('#correlationsConfigInput').val()
    };
}




function fillAppTable(apps) {
    const tableBody = $('#appTableBody');
    tableBody.empty();

    apps.forEach((app, index) => {
        const row = `<tr>
            <th scope="row">${app.app_id}</th>
            <td>${app.app_name}</td>
            <td>${app.policy_id}</td>
            <td>${app.agent_js_config}</td>
            <td>${app.correlations_config}</td>
            <td>
                <button class="btn btn-primary edit-app" data-index="${index}">Редактировать</button>
            </td>
        </tr>`;

        tableBody.append(row);
    });

    // Обработчик событий для кнопки "Редактировать"
    $('.edit-app').click(function() {
        const appIndex = $(this).data('index');
        const app = apps[appIndex];

        fillAppForm(app);
        $('#appIdInput').prop('readonly', true);
        editingAppIndex = appIndex;

        $('#appModal').modal('show');
    });
}



$(document).ready(() => {
    // Здесь мы добавляем обработчики событий для кнопок

    $('#addAppBtn').click(() => {
        clearAppForm();
        $('#appIdInput').prop('readonly', false);
        editingAppIndex = null;
    });

    $('#saveAppBtn').click(async () => {
        let app = getAppDataFromForm();
        let isNewApp = editingAppIndex === null;
        let error = await saveApp(app, isNewApp);
        if (error == '0') {
            $('#appModal').modal('hide');
            if (editingAppIndex !== null) {
                apps[editingAppIndex] = app;
            } else {
                apps.push(app);
            }
            fillAppTable(apps);
            updateChart(apps);
        } else {
            $('.error-message').text('Ошибка при сохранении приложения');
        }
    });

    loadApps();
});