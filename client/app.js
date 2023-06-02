let apps = [];
let editingAppIndex = null;

function getAppDataFromForm() {
    return {
        app_id: $('#appIdInput').val(),
        app_name: $('#nameInput').val(),
        policy_id: parseInt($('#policyIdInput').val()),
        agent_js_config: $('#agentJsConfigInput').val(),
        correlations_config: $('#correlationsConfigInput').val(),
    };
}

let chart = null;

function updateChart(apps) {
    const ctx = document.getElementById('chart').getContext('2d');
  
    const labels = getMinutesRange();
    const datasets = [
      {
        label: 'Policy ID 1',
        data: apps.map(app => parseInt(app.policy_id)),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      },
      {
        label: 'Policy ID 2',
        data: apps.map(app => parseInt(app.policy_id)),
        backgroundColor: 'rgba(192, 75, 192, 0.5)',
        borderColor: 'rgb(192, 75, 192)',
        borderWidth: 1
      },
      {
        label: 'Policy ID 3',
        data: apps.map(app => parseInt(app.policy_id)),
        backgroundColor: 'rgba(192, 192, 75, 0.5)',
        borderColor: 'rgb(192, 192, 75)',
        borderWidth: 1
      }
    ];
  
    if (chart) {
      chart.destroy();
    }
  
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Minutes'
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Policy ID'
            }
          }
        }
      }
    });
  }
  
  function getMinutesRange() {
    const minutes = [];
    for (let i = 0; i < 60; i++) {
      const hour = Math.floor(i / 60);
      const minute = i % 60;
      const time = `${padZero(hour)}:${padZero(minute)}`;
      minutes.push(time);
    }
    return minutes;
  }
  
  function padZero(number) {
    return number.toString().padStart(2, '0');
  }
  


function fillAppForm(app) {
    // Здесь мы заполняем форму данными приложения.
    $('#appIdInput').val(app.app_id);
    $('#nameInput').val(app.app_name);
    $('#policyIdInput').val(app.policy_id);
    $('#agentConfigInput').val(app.agent_js_config);
    $('#correlationsConfigInput').val(app.correlations_config);
}

function clearAppForm() {
    // Здесь мы очищаем форму
    $('#appIdInput').val('');
    $('#nameInput').val('');
    $('#policyIdInput').val('');
    $('#agentConfigInput').val('');
    $('#correlationsConfigInput').val('');
    $('.error-message').text('');
}

async function loadApps() {
    let response = await fetch('http://checkstatus.website:8099/Face/App_List', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: "'" + "'"
    });
    let data = await response.json();

    apps = data.app_table_ids.map((id, index) => ({
        app_id: id,
        app_name: data.names[index],
        policy_id: data.policy_ids[index],
        agent_js_config: data.agent_js_configs[index],
        correlations_config: data.correlations_configs[index]
    }));

    fillAppTable(apps);
    updateChart(apps);
}

async function saveApp(app, isNewApp) {
    let url = isNewApp ? 'http://checkstatus.website:8099/Face/New_app' : 'http://checkstatus.website:8099/Face/Update_app';
    let method = 'POST';

    console.log(app);

    let response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: "'" + JSON.stringify(app) + "'"
    });

    let data = await response.json();
    return data.error;
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
        if (error == 0) {
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
