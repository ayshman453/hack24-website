import React, { createContext, useEffect, useState } from 'react'
import Connection from './Connection'
import Publisher from './Publisher'
import Subscriber from './Subscriber'
import Receiver from './Receiver'
import mqtt from 'mqtt'

export const QosOption = createContext([])
const qosOption = [
    {
        label: '0',
        value: 0,
    },
    {
        label: '1',
        value: 1,
    },
    {
        label: '2',
        value: 2,
    },
]

const HookMqtt = () => {
    const [client, setClient] = useState(null)
    const [isSubed, setIsSub] = useState(false)
    const [payload, setPayload] = useState({})
    const [connectStatus, setConnectStatus] = useState('Connect')

    const mqttConnect = (host, mqttOption) => {
        setConnectStatus('Connecting')
        setClient(mqtt.connect(host, mqttOption))
    }

    useEffect(() => {
        if (client) {
            client.on('connect', () => {
                setConnectStatus('Connected')
                console.log('connection successful')
            })

            client.on('error', (err) => {
                console.error('Connection error: ', err)
                client.end()
            })

            client.on('reconnect', () => {
                setConnectStatus('Reconnecting')
            })

            client.on('message', (topic, message) => {
                const payload = { topic, message: message.toString() }
                setPayload(payload)
                console.log(`received message: ${message} from topic: ${topic}`)
            })
        }
    }, [client])

    const mqttDisconnect = () => {
        if (client) {
            try {
                client.end(false, () => {
                    setConnectStatus('Connect')
                    console.log('disconnected successfully')
                })
            } catch (error) {
                console.log('disconnect error:', error)
            }
        }
    }

    const mqttPublish = (context) => {
        if (client) {
            // topic, QoS & payload for publishing message
            const { topic, qos, payload } = context
            client.publish(topic, payload, { qos }, (error) => {
                if (error) {
                    console.log('Publish error: ', error)
                }
            })
        }
    }

    const mqttSub = (subscription) => {
        if (client) {
            const { topic, qos } = subscription
            client.subscribe(topic, { qos }, (error) => {
                if (error) {
                    console.log('Subscribe to topics error', error)
                    return
                }
                console.log(`Subscribe to topics: ${topic}`)
                setIsSub(true)
            })
        }
    }

    const mqttUnSub = (subscription) => {
        if (client) {
            const { topic, qos } = subscription
            client.unsubscribe(topic, { qos }, (error) => {
                if (error) {
                    console.log('Unsubscribe error', error)
                    return
                }
                console.log(`unsubscribed topic: ${topic}`)
                setIsSub(false)
            })
        }
    }

    return (
        <>
            <Connection
                connect={mqttConnect}
                disconnect={mqttDisconnect}
                connectBtn={connectStatus}
            />
            <QosOption.Provider value={qosOption}>
                <Subscriber sub={mqttSub} unSub={mqttUnSub} showUnsub={isSubed} />
                <Publisher publish={mqttPublish} />
            </QosOption.Provider>
            <Receiver payload={payload} />
        </>
    )
}

export default HookMqtt
