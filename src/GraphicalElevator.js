import React from 'react';
import * as R from 'ramda';
import styled from '@emotion/styled';

const floorHeight = 200;

const Container = styled.div`
    background: rgb(200, 200, 200);
`;

const Floor = styled.div`
    background: rgb(230, 240, 240);
    height: ${floorHeight}px;
    margin-bottom: 40px;
    box-shadow: 0 5px 5px rgba(0,0,0,0.3);
`;

const Cabin = styled.div`
`;

function GraphicalElevator({ numFloors }) {
  return (
    <Container>
        {R.range(0, numFloors).map(floor => (
          <Floor></Floor>
        ))}
        <Cabin />
    </Container>
  );
}

export default GraphicalElevator;
