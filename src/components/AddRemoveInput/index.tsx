import { IconButton } from '@mui/material';
import {
  ChangeEvent, useEffect, useState,
} from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export type TInputField = {
  accountName: string
};

export default function AddRemoveInput(props: { onChange: any, accountIdCheck: any, accountStatuses: any }) {
  const [inputFields, setInputFields] = useState<TInputField[]>([{
    accountName: '',
  }]);

  const PENDING = 'pending';
  const NOT_FOUND = 'not_found';

  const {
    onChange, accountIdCheck, accountStatuses,
  } = props;

  const addInputField = () => {
    const rows = [...inputFields, {
      accountName: '',
    }];
    setInputFields(rows);
    onChange(rows);
  };

  const removeInputFields = (index: number) => {
    const rows = [...inputFields];
    rows.splice(index, 1);
    setInputFields(rows);
    onChange(rows);
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const list:any = [...inputFields];
    list[index][name] = value;
    setInputFields(list);
    accountIdCheck(value);
    onChange(list);
  };

  return (
    <div className="add-remove-input">
      {
        inputFields.map((data: TInputField, index: number) => {
          const { accountName } = data;
          const number = index;
          return (
            <div className="form-group" key={number}>
              <input type="text" onChange={(e) => handleChange(index, e)} value={accountName} name="accountName" className="form-control" />
              {(number === 0)
                ? (
                  <IconButton aria-label="add new item" onClick={addInputField}>
                    <AddIcon />
                  </IconButton>
                )
                : (
                  <IconButton aria-label="remove item" onClick={() => removeInputFields(number)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              <div className="form-row_error">
                {accountName && accountStatuses[accountName] === NOT_FOUND && <span className="red">Account does not exist</span>}
                {accountStatuses[accountName] === PENDING && <span className="gray">Checking...</span>}
              </div>
            </div>
          );
        })
      }

    </div>
  );
}
