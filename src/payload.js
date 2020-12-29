module.exports = {
    modal: context => {
        return {
            trigger_id: context.trigger_id,
            view: JSON.stringify({
                type: "modal",
                submit: {
                    type: "plain_text",
                    text: "Submit",
                    emoji: true
                },
                close: {
                    type: "plain_text",
                    text: "Cancel",
                    emoji: true
                },
                title: {
                    type: "plain_text",
                    text: "Secure share",
                    emoji: true
                },
                blocks: [
                    {
                        type: "input",
                        block_id: "secure-share",
                        label: {
                            type: "plain_text",
                            text: ":pencil2: Pen down your message here!",
                            emoji: true
                        },
                        element: {
                            action_id: "secure-share-msg",
                            type: "plain_text_input",
                            multiline: true,
                        },
                        optional: false
                    },
                    {
                        block_id: "my_block_id",
                        type: "input",
                        element: {
                            type: "conversations_select",
                            action_id: "my_action_id",
                            response_url_enabled: true,
                        },
                        label: {
                            type: "plain_text",
                            text: "Select a channel to post the result on"
                        }
                    }
                ]
            })
        }
    }
}