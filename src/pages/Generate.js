import { Button, Input } from 'antd';
import React, { useState } from 'react';

function Generate(props) {
    const [actionName, setActionName] = useState('');
    const [actionParams, setActionParams] = useState('');
    const [sagaFunctionName, setSagaFunctionName] = useState('');
    const [apiCallName, setApiCallName] = useState('');
    const [result, setResult] = useState('');

    function confirm() {
        let resultTemp = "";
        resultTemp = addToResult(resultTemp, `
            ========================= action.js =====================<br/>
        `)
        resultTemp = addToResult(resultTemp, `
            export function ${actionName}(payload) { <br/>
                return { <br/>
                    type: "${actionName}",<br/>
                    payload,<br/>
                };<br/>
            }<br/>
            export function ${actionName}_SUCCESS(payload) {<br/>
                return {<br/>
                    type: "${actionName}_SUCCESS",<br/>
                    payload,<br/>
                };<br/>
            }<br/>
            export function ${actionName}_FAIL(payload) {<br/>
                return {<br/>
                    type: "${actionName}_FAIL",<br/>
                    payload,<br/>
                };<br/>
            }<br/>
            export function RESET_${actionName}(payload) {<br/>
                return {<br/>
                    type: "RESET_${actionName}",<br/>
                    payload,<br/>
                };<br/>
            }<br/>
         `);


        resultTemp = addToResult(resultTemp, `
            ========================= ui =====================<br/>
        `)

        resultTemp = addToResult(resultTemp, `
            dispatch(${actionName}(${actionParams ? `${actionParams}` : ""}));
        `)

        resultTemp = addToResult(resultTemp, `
            ======================= reduder.js ==========================<br/>
        `)

        resultTemp = addToResult(resultTemp, `
            case ${actionName}().type: {<br/>
                return {<br/>
                    ...state,<br/>
                    state: REQUEST_STATE.REQUEST,<br/>
                };<br/>
            }<br/>
            case ${actionName}_SUCCESS().type: {<br/>
                return {<br/>
                    ...state,<br/>
                    state: REQUEST_STATE.SUCCESS,<br/>
                };<br/>
            }<br/>

            case ${actionName}_FAIL().type: {<br/>
                return {<br/>
                    ...state,<br/>
                    state: REQUEST_STATE.ERROR,<br/>
                };<br/>
            }<br/>

            case RESET_${actionName}().type: {<br/>
                return {<br/>
                    ...defaultState,<br/>
                };<br/>
            }<br/>
        `)

        resultTemp = addToResult(resultTemp, `
            ======================= saga.js ==========================<br/>
        `)

        resultTemp = addToResult(resultTemp, `
            yield takeLatest(${actionName}().type, ${camelize(actionName)});<br/>
        `)

        resultTemp = addToResult(resultTemp, `
        function* ${camelize(actionName)}({ type, payload }) {<br/>
            ${actionParams ? `const { ${actionParams} } = payload;<br/>` : ""}
            try {<br/>
                const response = yield call(${apiCallName} ${actionParams ? `,{${actionParams}}` : ""});<br/>
                if (response.state === REQUEST_STATE.SUCCESS) {<br/>
                    yield put(${actionName}_SUCCESS({<br/>
                        data: response<br/>
                    }));<br/>
                } else {<br/>
                    yield put(${actionName}_FAIL());<br/>
                }<br/>
            } catch (error) {<br/>
                console.log('error: ', error);<br/>
            }<br/>
        }<br/>
        `)

        setResult(resultTemp);
    }

    function camelize(str) {
        str = str.toLowerCase();
        return str.replace(/^([A-Z])|[\s-_]+(\w)/g, function (match, p1, p2, offset) {
            if (p2) return p2.toUpperCase();
            return p1.toLowerCase();
        });
    }

    function addToResult(result, string) {
        return result.concat(string, "<br/>");
    }

    function reset() {
        setActionName("");
        setActionParams("");
        setApiCallName("");
        setSagaFunctionName("");
        setResult("");
    }

    return (
        <div>
            <Input
                placeholder='Nhập tên action'
                style={{
                    width: "300px"
                }}
                value={actionName}
                onChange={(e) => setActionName(e.target.value.toUpperCase())}
            ></Input>
            <Input
                placeholder='Nhập tên hàm call API'
                style={{
                    width: "300px"
                }}
                value={apiCallName}
                onChange={(e) => setApiCallName(e.target.value)}
            ></Input>
            <Input
                placeholder='Nhập tên params truyền vào cho action(optional)'
                style={{
                    width: "300px"
                }}
                value={actionParams}
                onChange={(e) => setActionParams(e.target.value)}
            ></Input>
            <Input
                placeholder='Nhập tên hàm trong saga(optional)'
                style={{
                    width: "300px"
                }}
                value={sagaFunctionName}
                onChange={(e) => setSagaFunctionName(e.target.value)}
            ></Input>
            <Button
                type='primary'
                onClick={confirm}
            >
                CONFIRM
            </Button>
            <Button
                type='primary'
                onClick={reset}
            >
                RESET
            </Button>
            <div
                style={{
                    marginTop: "20px",
                }}
            >
                {<div dangerouslySetInnerHTML={{ __html: result }} />}
            </div>

        </div>
    );
}

export default Generate;