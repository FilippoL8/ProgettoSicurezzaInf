# ProgettoSicurezzaInf
Il progetto è composto da un web client e un server che comunicano utilizzando WebTransport API
https://www.w3.org/TR/webtransport/

L'obiettivo del progetto è instaurare una connessione sicura tra il client e il server e monitorarne le prestazioni. Si è scelto l'utilizzo di WebTransport in quanto tecnologia che garantisce una comunicazione sicura e affidabile tra i due attori senza compromettere eccessivamente le prestazioni.

WebTransport si basa su HTTP/3 il quale abbandona la struttura del TCP e introduce l'utilizzo di QUIC, prevede inoltre l'utilizzo di alcuni meccanismi di sicurezza obbligatori, il cui mancato funzionamento o errato settaggio portano ad un fallimento fatale. Tra questi meccanismi troviamo l'utilizzo di TLS 1.3 e di certificati con requisiti molto stringenti.

A causa di questi ultimi, è impossibile effettuare test in localhost con certificati self-signed. Per risolvere al problema bisogna utilizzare un Autorità di Certificazione locale, a tal scopo si consiglia l'utilizzo di https://github.com/FiloSottile/mkcert il quale permette di gestire agevolmente una AC locale e di generare certificati che vengono considerati ammissibili localmente in modo agevolato.



Sono presenti due versioni di codice, con unica differenza tra le due la presenza di algoritmi di criptazione e decriptazione a livello di contenuto con AES-GCM-256, questo permette di avere un ulteriore layer di sicurezza. La scelta di avere queste due versioni del codice è per confrontare le prestazioni e lo slowdown ottenuto aggiungendo un ulteriore step di sicurezza nella comunicazione.


L'utilizzo è abbastanza semplice: in seguito all'avvio del server, il client va a connettersi, decide il messaggio e il numero (pre-impostato) di datagrammi da inviare e si mette in attesa di risposta. All'arrivo di tutti i datagrammi attesi otteniamo delle statistiche sul tempo medio e totale della comunicazione. Per avviare il server si esegue a terminale
> python3 webtransport_server.py certificato.pem chiave.key

Da diversi test effettuati sulla mia macchina abbiamo uno slow-down tra il 17% e il 25% del tempo totale nel caso di più invii simultanei, mentre tra il 37% e il 40% nel caso di singoli datagrammi.
