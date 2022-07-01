import { ChangeEvent, useState } from 'react';

export type TInputField = {
  accountName: string
};

export default function AddRemoveInput() {
  const [inputFields, setInputFields] = useState<TInputField[]>([{
    accountName: '',
  }]);

  const addInputField = () => {
    setInputFields([...inputFields, {
      accountName: '',
    }]);
  };

  const removeInputFields = (index: number) => {
    const rows = [...inputFields];
    rows.splice(index, 1);
    setInputFields(rows);
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const list:any = [...inputFields];
    list[index][name] = value;
    setInputFields(list);
  };

  return (
    <div>
      {
        inputFields.map((data: TInputField, index: number) => {
          const { accountName } = data;
          const number = index;
          return (
            <div className="form-group" key={number}>
              <input type="text" onChange={(e) => handleChange(index, e)} value={accountName} name="accountName" className="form-control" placeholder="Account name" />
              {(inputFields.length !== 1) ? <button className="button" type="button" onClick={() => removeInputFields(number)}>x</button> : ''}
            </div>
          );
        })
      }

      <button className="button" type="button" onClick={addInputField}>Add New</button>
    </div>
  );
}
