
let currentTransport, streamNumber, currentTransportDatagramWriter;

// Handler del pulsante Connect
async function connect() {
  const url = document.getElementById('url').value;
  
  try {
    var transport = new WebTransport(url);
  } catch (e) {
    addToEventLog('Failed to create connection object. ' + e, 'error');
    return;
  }

  try {
    await transport.ready;
    addToEventLog('Ready.');
  } catch (e) {
    addToEventLog('Connection failed. ' + e, 'error');
    return;
  }

  transport.closed
      .then(() => {
        addToEventLog('Connection closed normally.');
      })
      .catch(() => {
        addToEventLog('Connection closed abruptly.', 'error');
      });

  currentTransport = transport;
  streamNumber = 1;
  try {
    currentTransportDatagramWriter = transport.datagrams.writable.getWriter();
    addToEventLog('Datagram writer ready.');
  } catch (e) {
    addToEventLog('Sending datagrams not supported: ' + e, 'error');
    return;
  }
  readDatagrams(transport);
  acceptUnidirectionalStreams(transport);
  document.forms.sending.elements.send.disabled = false;
  document.getElementById('connect').disabled = true;
}

// Handler del pulsante Send
async function sendData() {
  let form = document.forms.sending.elements;
  let encoder = new TextEncoder('utf-8');
  let rawData = sending.data.value;
  let data = encoder.encode(rawData);
  let transport = currentTransport;
  let totalRTT=0;
  let rttCount=0;
  try {
    const startTime = performance.now();
    switch (form.sendtype.value) {
      case 'first': { 
        let start=performance.now();
        await currentTransportDatagramWriter.write(data);
        await readDatagrams(transport); 
        rttCount=1;
        totalRTT=performance.now()-start;
        addToEventLog('E\' stato mandato un datagramma con: '+rawData);
        break;
      } 

      case 'second': {
        for (let i=0; i<1000; i++) {
          const rttStart=performance.now();
          await currentTransportDatagramWriter.write(data);
          const rttEnd=performance.now();
          const rtt=rttEnd-rttStart;
          totalRTT+=rtt;
          rttCount++; 
        }
        addToEventLog('Sono stati mandati 1.000 Datagrammi con: '+rawData);
        await readDatagrams(transport);
        break;
      }

      case 'third': {
        for (let i=0; i<100000; i++) {
          const rttStart=performance.now();
          await currentTransportDatagramWriter.write(data);
          await readDatagrams(transport);
          const rttEnd=performance.now();
          const rtt=rttEnd-rttStart;
          totalRTT+=rtt;
          rttCount++; 
        }
        addToEventLog('Sono stati mandati 100.000 Datagrammi con: '+rawData);
        break;
      }
    }
    //Variabili di misurazione
    const endTime = performance.now();
    const totalTime = (endTime-startTime)/1000; //Tempo totale in secondi
    const avgRTT=totalRTT/rttCount;

    //Scrittura dei risultati
    addToEventLog('Tempo totale impiegato: '+ totalTime.toFixed(4) +' secondi');
    addToEventLog('RTT Medio: '+ avgRTT.toFixed(4) +' ms'); 

  } catch (e) {
    addToEventLog('Error while sending data: ' + e, 'error');
  }
}

async function readDatagrams(transport) {
  try {
    var counter=0;
    var reader = transport.datagrams.readable.getReader();
  } catch (e) {
    ///Errore con il reader (occupato?) 
    return;
  }
  let decoder = new TextDecoder('utf-8');
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        //Terminata lettura del singolo datagramma
        return;
      }
      let data = decoder.decode(value);
      //counter++;   Serviva per un test delle prestazioni, da non inserire (alto numero di nodes)
      //addToEventLog(counter);
    }
  } catch (e) {
    addToEventLog('Error while reading datagrams: ' + e, 'error');
  }
}

/*
async function acceptUnidirectionalStreams(transport) {
  let reader = transport.incomingUnidirectionalStreams.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        addToEventLog('Done accepting unidirectional streams!');
        return;
      }
      let stream = value;
      let number = streamNumber++;
      addToEventLog('New incoming unidirectional stream #' + number);
      readFromIncomingStream(stream, number);
    }
  } catch (e) {
    addToEventLog('Error while accepting streams: ' + e, 'error');
  }
}
*/

function addToEventLog(text, severity = 'info') {
  let log = document.getElementById('event-log');
  let mostRecentEntry = log.lastElementChild;
  let entry = document.createElement('li');
  entry.innerText = text;
  entry.className = 'log-' + severity;
  log.appendChild(entry);

  if (mostRecentEntry != null &&
      mostRecentEntry.getBoundingClientRect().top <
          log.getBoundingClientRect().bottom) {
    entry.scrollIntoView();
  }
}
